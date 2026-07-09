import AdminStudentClassesClient from "@/components/AdminStudentClassesClient";

export default async function AdminStudentClassesPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  return <AdminStudentClassesClient studentId={studentId} />;
}
