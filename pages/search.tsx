"use client"
import {useEffect, useState} from "react";
import Head from "next/head"
import Link from "next/link"
import useSWRInfinite from "swr/infinite";
import { Layout } from "@/components/layout/layout"
import { ItemCard } from "@/components/search/item-card";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config/site"
import { buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchFilter } from "@/components/search/search-filter"

export default function Search() {

  const PAGE_SIZE = 24;
  
  const [searchParams, setSearchParams] = useState({
      index: 'collections',
      from: '0',
      size: '24'
    });
  const [query, setQuery] = useState("");
  //const [items, setItems] = useState([]);
  //const [options, setOptions] = useState([]);
  const [error, setError] = useState("");

  const fetcher = (...args) => fetch(...args).then(res => res.json())

  const indexAggregations = {
    collections: [
      { name: 'primaryConstituent', displayName: 'Maker' },
      { name: 'classification', displayName: 'Classification' },
      { name: 'medium', displayName: 'Medium' },
      { name: 'period', displayName: 'Period' },
      { name: 'dynasty', displayName: 'Dynasty' },
      { name: 'museumLocation', displayName: 'Museum Location' },
      { name: 'section', displayName: 'Section' },
    ]
  }




  const {
    data,
    mutate,
    size,
    setSize,
    isValidating,
    isLoading
  } = useSWRInfinite(
    (index) =>
      `/api/search?${new URLSearchParams(searchParams)}`,
    fetcher
  );

  const pageData = data?.[0]?.data
  const items = pageData ? [].concat(...pageData) : [];
  const options = data?.[0]?.options || {};
  const isLoadingMore =
    isLoading || (size > 0 && pageData && typeof pageData[size - 1] === "undefined");
  const isEmpty = pageData?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (pageData && pageData[pageData.length - 1]?.length < PAGE_SIZE);
  const isRefreshing = isValidating && pageData && pageData.length === size;


  useEffect(() => {
    const getData = setTimeout(() => {
      console.log('query change');
      //search();
      setSearchParams({...searchParams, ...{ query: query }})
    }, 600);
    return () => clearTimeout(getData);
  }, [query])

  function handleFilterChange(name: string, key: string, e) {
    console.log('filter change: ', name, key)
  }

  async function sendRequest(url, { arg }) {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(arg)
    }).then(res => res.json())
  }

  function search() {
    console.log('init search ' + query)
    setError('')
    const postData = async () => {
      const params = {
        index: 'collections',
        from: '0',
        size: '24',
        query: query,
      };
      const response = await fetch('/api/search?' + new URLSearchParams(params));
      return response.json();
    };
    postData().then((res) => {
      if (res.error) setError(JSON.stringify(res.error));
      if (res.data) setItems(res.data);
      else setItems([]);
      if (res.options) setOptions(res.options);
      else setOptions([]);
      console.log(res);
    });
  }

  return (
    <Layout>
      <Head>
        <title>Search : Brooklyn Museum</title>
        <meta
          name="description"
          content="Elasticsearch + Next.js Search Prototype"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container grid sm:grid-cols-3 md:grid-cols-4 gap-6 pt-6 pb-8 md:py-10">
        <div className="sm:col-span-1 h-full space-y-6">
          <Input name="query" placeholder="Search" onChange={(e) => setQuery(e.target.value)} />
          {indexAggregations.collections?.map(
            (filter, index) =>
              filter && (
                <SearchFilter filter={filter} options={options[filter.name]} checked={false} onChangeHandler={handleFilterChange} />
              )
          )}
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Has image
            </label>
          </div>
        </div>
        <div className="sm:col-span-2 md:col-span-3">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl mb-2">
            Collection Search
          </h1>
          {error?.length > 0 &&
            <h3 className="text-lg text-red-800 font-extrabold leading-tight tracking-tighter mb-6">
              {error}
            </h3>
          }
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 pb-2">
          {items.length} results
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2 pb-8 md:pb-10">
            {items.length && items?.map(
              (item, index) =>
                item._id && (
                  <div className="">
                    <ItemCard item={item} />
                  </div>
                )
            )}
          </div>
          <button
            className={buttonVariants({ size: "sm" })}
            disabled={isLoadingMore || isReachingEnd}
            onClick={() => {
              setSize(size + 1);
            }}
            >
            Load More
          </button>
        </div>
      </section>
    </Layout>
  )
}
