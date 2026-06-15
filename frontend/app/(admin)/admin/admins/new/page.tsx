import TitleHeader from "@/app/(admin)/components/title-header";
import React from "react";
import NewAdmin from "../components/new-admin";

const NewAdminPage = () => {
  return (
    <div className="p-4 mt-2 w-3/4 max-md:w-full mx-auto">
      <TitleHeader title="Create new admin" description="Create a new admin" />
      <NewAdmin />
    </div>
  );
};

export default NewAdminPage;
