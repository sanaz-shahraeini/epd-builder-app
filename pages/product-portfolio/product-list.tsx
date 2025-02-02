
import { useSession } from "next-auth/react";
import ProductList from "@/components/product-portfolio/product-list";

export default function ProductListPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>You need to be authenticated to view this page.</div>;
  }

  return <ProductList />;
}