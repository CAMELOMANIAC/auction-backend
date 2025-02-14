import fs from "fs";
import ErrorCode, { errorCodeAnswer } from "./errorCode";

type ImgBBImage = {
  filename: string;
  name: string;
  mime: string;
  extension: string;
  url: string;
};

type ImgBBResponseData = {
  id: string;
  title: string;
  url_viewer: string;
  url: string;
  display_url: string;
  width: string;
  height: string;
  size: string;
  time: string;
  expiration: string;
  image: ImgBBImage;
  thumb: ImgBBImage;
  medium: ImgBBImage;
  delete_url: string;
};

type ImgBBResponse = {
  data: ImgBBResponseData;
  success: boolean;
  status: number;
};

/**
 * img-bb api로 이미지 업로드
 *
 * @param {Express.Multer.File} imageFile - 보낼 이미지 파일
 * @returns {Promise<{url: string, deleteUrl: string} | undefined>} - 성공시 접근 url과 삭제에 필요한 deleteUrl을 반환
 * @throws
 */
export const fetchImageUpload = async (
  imageFile: Express.Multer.File
): Promise<{ url: string; deleteUrl: string } | undefined> => {
  // 파일 읽기
  const fileBuffer = fs.readFileSync(imageFile.path);

  // FormData 생성
  const formData = new FormData();
  formData.append("image", fileBuffer.toString("base64"));

  try {
    const response = await fetch("https://api.imgbb.com/1/upload?key=" + process.env.IMAGE_BB_KEY, {
      method: "POST",
      body: formData,
    });
    const result: ImgBBResponse = await response.json();

    if (result.success) {
      console.log("이미지 업로드 성공", imageFile.filename);
      return { url: result.data.url, deleteUrl: result.data.delete_url };
    } else {
      console.error("이미지 업로드 실패", result);
      throw new Error(errorCodeAnswer[ErrorCode.IMAGE_NOT_UPLOADED].message);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    } else if (typeof error === "string") {
      throw new Error(error);
    }
  }
};

/**
 * img-bb api로 이미지 삭제
 *
 * @param {string} deleteUrl - 이미지 삭제할 url
 * @returns {Promise<void>} - 성공시 void, 실패시 에러
 */
export const fetchImageDelete = async (deleteUrl: string): Promise<void> => {
  try {
    const response = await fetch(deleteUrl, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("이미지 삭제 성공");
    } else {
      console.error("이미지 삭제 실패");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
