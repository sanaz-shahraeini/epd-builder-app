import { useSession } from "next-auth/react";
import ProductList from "@/components/product-portfolio/product-list";

export default function ProductListPage() {
  const session = useSession();

  if (session.status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session.data) {
    return <div>You need to be authenticated to view this page.</div>;
  }

  return <ProductList />;
}