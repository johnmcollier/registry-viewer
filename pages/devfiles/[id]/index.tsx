import { Devfile, GetMetadataOfDevfiles, GetDevfileYAML } from 'custom-types';
import { getMetadataOfDevfiles, getDevfileYAML } from '@util/server';
import DevfilePageProjects from '@components/devfile-page/Projects';
import DevfilePageHeader from '@components/devfile-page/Header';
import DevfilePageYAML from '@components/devfile-page/YAML';
import ErrorBanner from '@components/ErrorBanner';

import { InferGetStaticPropsType, GetStaticProps, GetStaticPaths } from 'next';

interface Path {
  params: { id: string };
}
/**
 * Renders the {@link DevfilePage}
 *
 * @remarks
 *    stacks have header, starter projects, and yaml
 *    sample has header
 *
 * @param devfile - index information for devfile
 * @param devfileText - text of devfile YAML
 * @param devfileJSON -  json representation of devfile YAML
 */
const DevfilePage = ({
  devfile,
  devfileYAML,
  devfileJSON,
  errors
}: InferGetStaticPropsType<typeof getStaticProps>) => (
  <div style={{ alignContent: 'center', minHeight: '100vh' }}>
    <ErrorBanner errors={errors} />
    <div>
      <DevfilePageHeader devfileMetadata={devfileJSON.metadata} devfile={devfile} />
      {devfileJSON.starterProjects != null ? (
        <DevfilePageProjects starterProjects={devfileJSON.starterProjects} />
      ) : (
        <></>
      )}
      <DevfilePageYAML devfileYAML={devfileYAML} />
    </div>
  </div>
);

export const getStaticProps: GetStaticProps = async (context) => {
  const [devfiles, devfileErrors]: GetMetadataOfDevfiles = await getMetadataOfDevfiles();

  const devfile: Devfile = devfiles.find((devfile: Devfile) => {
    const id = context.params?.id as string;
    const [source, name] = id.split('+');
    return devfile.sourceRepo === source && devfile.name === name;
  })!;

  const [devfileYAML, devfileJSON, yamlErrors]: GetDevfileYAML = await getDevfileYAML(devfile);

  const errors = [...devfileErrors, ...yamlErrors];

  return {
    props: {
      devfile,
      devfileYAML,
      devfileJSON,
      errors
    },
    // Next.js will attempt to re-generate the page:
    // - When a request comes in
    // - At most once every 15 seconds
    revalidate: 15
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [devfiles, errors]: GetMetadataOfDevfiles = await getMetadataOfDevfiles();
  const sourceWithNames: string[] = devfiles.map(
    (devfile) => `${devfile.sourceRepo.replace(/\+/g, '')}+${devfile.name.replace(/\+/g, '')}`
  );
  const paths: Path[] = sourceWithNames.map((id) => ({ params: { id } }));

  return {
    paths,
    fallback: 'blocking'
  };
};

export default DevfilePage;
