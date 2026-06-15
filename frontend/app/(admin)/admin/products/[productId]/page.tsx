import TitleHeader from "@/app/(admin)/components/title-header"
import EditProduct from "../components/edit-product";

const EditPage = () => {
  return (
    <div className="p-4 mt-2 w-3/4 max-md:w-full mx-auto">
      <TitleHeader title="Edit product" description="Edit a product" />
      <EditProduct />
    </div>
  );
};

export default EditPage;
