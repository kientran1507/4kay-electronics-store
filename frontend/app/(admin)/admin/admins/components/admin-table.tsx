"use client";
import TitleHeader from "@/app/(admin)/components/title-header";
import { useAuth } from "@/app/utils/authContext";
import { createProtectedApi } from "@/lib/apiCalls";
import axios from "axios";
import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Spinner from "@/components/Spinner";
import ReactPaginate from "react-paginate";
import toast from "react-hot-toast";
import { Admin } from "@/types";

type AdminsResponse = {
  Admins: Admin[];
  currentPage: number;
  totalPages: number;
  totalAdmins: number;
};

const USERS_PER_PAGE = 10;

const AdminTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { error, data, isLoading } = useQuery({
    queryKey: ["admins", currentPage],
    queryFn: async () => {
      if (!user?.token) throw new Error('Unauthorized');
      const api = createProtectedApi(user.token);
      return api.admin.getAllAdmins();
    }
  });

  const deleteAdmin = async (id: string) => {
    try {
      if (!user?.token) throw new Error('Unauthorized');
      const api = createProtectedApi(user.token);
      await api.admin.deleteAdmin(id);
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.success("Admin deleted successfully");
    } catch (error) {
      toast.error("Error deleting admin");
    }
  };

  const handlePageClick = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected + 1);
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <p>Something went wrong!</p>;
  }

  return (
    <>
      <TitleHeader
        title="Manage Admins"
        description="Manage administrator accounts"
        url="/admin/admins/new"
        count={data?.totalAdmins || 0}
      />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <p className="text-gray-700">Name</p>
              </TableCell>
              <TableCell align="center">
                <p className="text-gray-700">Email</p>
              </TableCell>
              <TableCell align="center">
                <p className="text-gray-700">Phone</p>
              </TableCell>
              <TableCell align="center">
                <p className="text-gray-700">Date</p>
              </TableCell>
              <TableCell align="center">
                <p className="text-gray-700">Actions</p>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.admins.map((admin: Admin) => (
              <TableRow
                key={admin._id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{admin.name}</TableCell>
                <TableCell align="center">{admin.email}</TableCell>
                <TableCell align="center">{admin.phone || "N/A"}</TableCell>
                <TableCell align="center">
                  {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell align="center">
                  <button onClick={() => deleteAdmin(admin._id)}>
                    <DeleteIcon className="text-red-600" />
                  </button>
                  <Link href={`/admin/admins/edit/${admin._id}`}>
                    <EditIcon />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default AdminTable;
