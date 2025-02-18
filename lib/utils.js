import axios from "axios";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import imageCompression from "browser-image-compression";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const uploadPhoto = async (file) => {
  const formData = new FormData();
  const compressedFile = (await handleImageCompression(file)) // as File;
  formData.append("upload_preset", "cv-connect");
  formData.append("file", compressedFile);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/dbotdcaxi/auto/upload`,
    formData,
    {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    }
  );

  return {
    url: res.data.url,
    public_id: res.data.url,
  };
};
export const handleImageCompression = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  try {
    // console.log('before compressed', file.size / 1024 / 1024 + 'MB')
    const compressedFile = await imageCompression(file, options);
    // console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB

    // console.log('compressed file', compressedFile)
    return compressedFile;
  } catch (error) {
    console.log(error);
  }
};