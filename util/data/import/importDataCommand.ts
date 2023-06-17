/**
 * Import Elasticsearch data from JSON files.
 *
 * npx ts-node --compiler-options {\"module\":\"CommonJS\"} ./util/data/import/importDataCommand.ts
 */

import { abort, ask, questionsDone } from '@/util/command';
import { loadEnvConfig } from '@next/env';

import { importJsonlFileData } from './importDatafile';
import { updateAllTerms } from './updateTerms';

const ID_FIELD_NAME = 'id';

loadEnvConfig(process.cwd());

async function run() {
  const dataset = process.env.DATASET || 'brooklynMuseum';
  let ctm = await import(`./transform/${dataset}/transformCollectionObject`);
  const collectionsTransformable = ctm.transformable;
  ctm = await import(`./transform/${dataset}/transformContent`);
  const contentTransformable = ctm.transformable;
  ctm = await import(`./transform/${dataset}/transformArchive`);
  const archiveTransformable = ctm.transformable;

  const collectionsDataFile = `./data/${dataset}/collections.jsonl.gz`;
  const contentDataFile = `./data/${dataset}/content.jsonl.gz`;
  const termsDataFile = `./data/${dataset}/terms.jsonl.gz`;
  const artistTermsDataFile = `./data/${dataset}/artistTerms.jsonl.gz`;
  const archivesDataFile = `./data/${dataset}/archivesSpaceDCRecords.jsonl.gz`;

  console.log('Import Elasticsearch data from JSON files.');
  if (process.env.ELASTICSEARCH_USE_CLOUD === 'true')
    console.log('WARNING: Using Elasticsearch Cloud');
  else
    console.log(
      'Using Elasticsearch host at ' + process.env.ELASTICSEARCH_HOST
    );

  if (
    (await ask(
      'Proceeding will overwrite existing Elasticsearch indices & data. Continue? (y/n) '
    )) !== 'y'
  )
    return abort();

  console.log('Beginning import of Elasticsearch data from JSON files...');

  if (
    (await ask(
      `Import collections index from ${collectionsDataFile}? (y/n) `
    )) === 'y'
  )
    await importJsonlFileData(
      'collections',
      ID_FIELD_NAME,
      collectionsDataFile,
      collectionsTransformable.transform,
      true
    );

  if (
    (await ask(`Import content index from ${contentDataFile}? (y/n) `)) === 'y'
  )
    await importJsonlFileData(
      'content',
      ID_FIELD_NAME,
      contentDataFile,
      contentTransformable.transform,
      true
    );

  if (
    (await ask(`Import archives index from ${archivesDataFile}? (y/n) `)) ===
    'y'
  )
    await importJsonlFileData(
      'archives',
      ID_FIELD_NAME,
      archivesDataFile,
      archiveTransformable.transform,
      true
    );

  if ((await ask(`Update terms? (y/n) `)) === 'y') await updateAllTerms();

  questionsDone();
}

run();
