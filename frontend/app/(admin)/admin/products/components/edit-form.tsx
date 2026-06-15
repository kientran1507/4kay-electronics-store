"use client";

import { Product, RequestData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import Image from "next/image";

type EditFormProps = {
  data: Product;
  onSubmit: (formData: RequestData) => void;
};

type InitialType = {
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
};

const EditForm = ({ data, onSubmit }: EditFormProps) => {
  const { name, description, image, category, price } = data;

  const initialState = {
    name,
    description,
    price,
    category,
    image,
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>(image);
  const [dataForm, setDataForm] = useState<InitialType>(initialState);

  useEffect(() => {
    setPreviewImage(image);
  }, [image]);

  useEffect(() => {
    setDataForm({
      name,
      description,
      price,
      category,
      image,
    });
  }, [image, name, description, price, category]);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newImageUrl = e.target.value;
    setDataForm((prevData) => ({
      ...prevData,
      image: newImageUrl,
    }));
    setPreviewImage(newImageUrl);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const requestData: RequestData = {
      name: dataForm.name,
      description: dataForm.description,
      price: dataForm.price,
      category: dataForm.category,
      image: dataForm.image
    };

    await onSubmit(requestData);
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-y-2 max-md:min-w-[90%] min-w-[70%] border p-4"
    >
      <label htmlFor="name">Enter Product Name</label>
      <Input
        value={dataForm.name}
        type="text"
        id="name"
        name="name"
        required
        placeholder="Enter Product name"
        onChange={(e) => setDataForm({ ...dataForm, name: e.target.value })}
      />
      <label htmlFor="price">Enter Product Price</label>
      <Input
        value={dataForm.price}
        type="number"
        id="price"
        min={1}
        name="price"
        required
        placeholder="Enter Product price"
        onChange={(e) => setDataForm({ ...dataForm, price: +e.target.value })}
      />
      <label htmlFor="description">Enter Product Description</label>
      <Input
        value={dataForm.description}
        type="text"
        id="description"
        name="description"
        required
        placeholder="Enter Product description"
        onChange={(e) =>
          setDataForm({ ...dataForm, description: e.target.value })
        }
      />
      <Input
        value={dataForm.category}
        type="text"
        id="category"
        name="category"
        required
        placeholder="Enter Product category"
        onChange={(e) =>
          setDataForm({ ...dataForm, category: e.target.value })
        }
      />
      <label htmlFor="image">Product Image URL</label>
      <Input
        type="text"
        id="image"
        name="image"
        value={dataForm.image}
        onChange={handleImageUrlChange}
        placeholder="Enter Image URL"
      />

      {/* Preview of the image */}
      {previewImage && (
        <div className="flex gap-2">
          <Image
            src={previewImage}
            alt="Preview"
            width={100}
            height={100}
            className="rounded-sm"
            priority={true}
          />
        </div>
      )}

      <Button disabled={isLoading} type="submit" className="mt-2 bg-green-600">
        Save Changes
      </Button>
    </form>
  );
};

export default EditForm;
