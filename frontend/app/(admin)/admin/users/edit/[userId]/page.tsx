import TitleHeader from "@/app/(admin)/components/title-header";
import React from "react";
import NewUser from "../../components/new-user";

const EditUserPage = () => {
  return (
    <div className="p-4 mt-2 w-3/4 max-md:w-full mx-auto">
      <TitleHeader title="Edit user" description="Edit an user's information" />
      <NewUser />
    </div>
  );
};

export default EditUserPage;
