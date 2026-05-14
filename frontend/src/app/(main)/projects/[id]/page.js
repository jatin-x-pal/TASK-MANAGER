import ProjectBoard from './ProjectBoard';

export default async function ProjectPage({ params }) {
  const { id } = await params;
  
  return <ProjectBoard id={id} />;
}
