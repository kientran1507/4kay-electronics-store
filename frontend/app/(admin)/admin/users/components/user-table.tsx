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
import { Customer } from "@/types";

type CustomersResponse = {
  customers: Customer[];
  currentPage: number;
  totalPages: number;
  totalCustomers: number;
};

const USERS_PER_PAGE = 10;

const UserTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { error, data, isLoading } = useQuery<CustomersResponse>({
    queryKey: ["customers", currentPage],
    queryFn: async () => {
      if (!user?.token) throw new Error('Unauthorized');
      const api = createProtectedApi(user.token);
      return api.admin.getAllCustomers(currentPage, USERS_PER_PAGE);
    },
    staleTime: 5000,
    refetchOnWindowFocus: false
  });

  const deleteUser = async (id: string) => {
    try {
      if (!user?.token) throw new Error('Unauthorized');
      const api = createProtectedApi(user.token);
      await api.admin.deleteCustomer(id);
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("User deleted successfully");
    } catch (error) {
      toast.error("Error deleting user");
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
        title="Manage Users"
        description="Manage customers"
        url="/admin/users/new"
        count={data?.totalCustomers || 0}
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
                <p className="text-gray-700">Address</p>
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
            {data?.customers.map((customer) => (
              <TableRow
                key={customer._id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>{customer.name}</TableCell>
                <TableCell align="center">{customer.email}</TableCell>
                <TableCell align="center">{customer.phone || "N/A"}</TableCell>
                <TableCell align="center">{customer.address || "N/A"}</TableCell>
                <TableCell align="center">
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}
                </TableCell>
                <TableCell align="center">
                  <button onClick={() => deleteUser(customer._id)}>
                    <DeleteIcon className="text-red-600" />
                  </button>
                  <Link href={`/admin/users/edit/${customer._id}`}>
                    <EditIcon />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {data && data.totalPages > 1 && (
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          breakLabel={"..."}
          pageCount={data.totalPages}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageClick}
          containerClassName={"pagination flex space-x-2 justify-end mt-4"}
          previousLinkClassName={"bg-neutral-800 px-4 py-2 rounded text-white"}
          nextLinkClassName={"bg-neutral-800 px-4 py-2 rounded text-white"}
          pageLinkClassName={"bg-neutral-800 px-4 py-2 rounded text-white"}
          disabledClassName={"opacity-50 cursor-not-allowed"}
          activeClassName={"!bg-blue-700"}
        />
      )}
    </>
  );
};

export default UserTable;
