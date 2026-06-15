import TitleHeader from "@/app/(admin)/components/title-header";
import React from "react";
import NewAdmin from "../../components/new-admin";

const EditPageAdmin = () => {
  return (
    <div className="p-4 mt-2 w-3/4 max-md:w-full mx-auto">
      <TitleHeader title="Edit Admin" description="Edit an admin's information" />
      <NewAdmin />
    </div>
  );
};

export default EditPageAdmin;
