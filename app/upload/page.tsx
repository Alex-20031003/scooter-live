'use client';

import "../styles/globals.scss";
import "../styles/Upload.scss";
import "../styles/Button.scss";
import Image from "next/image";
import { useState, useRef } from "react";
import axios from "axios";
import JSZip from "jszip";

export default function Upload() {
    const [files, setFiles] = useState<File[]>([]); // Загруженные файлы
    const [currentIndex, setCurrentIndex] = useState(0); // Текущий индекс файла
    const [resultFiles, setResultFiles] = useState<File[]>([]); // Разархивированные файлы из результата
    const [resultIndex, setResultIndex] = useState(0); // Индекс текущего файла результата
    const [originalArchive, setOriginalArchive] = useState<Blob | null>(null); // Оригинальный архив
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Проверка, является ли файл изображением
    const isImage = (file: File) => file.type.startsWith("image/");

    // Проверка, является ли файл видео
    const isVideo = (file: File) => file.type.startsWith("video/");

    // Загрузка файлов
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const uploadedFiles = Array.from(event.target.files);
            setFiles(uploadedFiles);
            setCurrentIndex(0); // Сбрасываем индекс
        }
    };

    // Навигация по загруженным файлам
    const handleNavigation = (direction: "right" | "left", isResult = false) => {
        const currentFiles = isResult ? resultFiles : files;
        const setIndex = isResult ? setResultIndex : setCurrentIndex;

        if (currentFiles.length === 0) return;

        if (direction === "right") {
            setIndex((prevIndex) => (prevIndex + 1) % currentFiles.length);
        } else if (direction === "left") {
            setIndex((prevIndex) => (prevIndex - 1 + currentFiles.length) % currentFiles.length);
        }
    };

    // Отправка файлов на сервер и обработка ответа
    const handleFileUploadToServer = async () => {
        if (files.length === 0) {
            alert("Завантажте файли перед відправкою.");
            return;
        }

        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });

        try {
            const response = await axios.post("http://127.0.0.1:8080/upload_media", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob",
            });

            // Сохранить оригинальный архив
            setOriginalArchive(response.data);

            // Разархивация результата
            const zip = new JSZip();
            const loadedZip = await zip.loadAsync(response.data);
            const unzippedFiles: File[] = [];

            for (const [filename, fileData] of Object.entries(loadedZip.files)) {
                if (!fileData.dir) {
                    const fileBlob = await fileData.async("blob");
                    const fileType = filename.endsWith(".mp4") ? "video/mp4" : "image/png";
                    console.log(fileType);
                    unzippedFiles.push(new File([fileBlob], filename, { type: fileType }));
                }
            }
            setResultFiles(unzippedFiles);
            setResultIndex(0);
        } catch (error) {
            console.error("Ошибка при отправке файлов:", error);
            alert("Не удалось отправить файлы. Проверьте сервер.");
        }
    };

    // Функция для скачивания оригинального архива
    const downloadOriginalArchive = () => {
        if (!originalArchive) {
            alert("Оригинальный архив не загружен.");
            return;
        }

        const url = URL.createObjectURL(originalArchive);
        const a = document.createElement("a");
        a.href = url;
        a.download = "original_archive.zip"; // Имя файла, который будет скачан
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="container-upload-result">
            {/* Левая часть - Загрузка файлов */}
            <div className="upload">
                <div className="box box-upload" onClick={() => fileInputRef.current?.click()}>
                    {files.length === 0 ? (
                        "Завантажте фото у форматі png, jpg або відео у форматі mp4"
                    ) : isImage(files[currentIndex]) ? (
                        <img
                            src={URL.createObjectURL(files[currentIndex])}
                            alt="Preview"
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                    ) : isVideo(files[currentIndex]) ? (
                        <video
                            src={URL.createObjectURL(files[currentIndex])}
                            controls
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                    ) : (
                        <p>Файл не підтримується</p>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, video/mp4"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                />
                <div className="upload-arrows">
                    <Image
                        src="/Arrow1.svg"
                        alt="Arrow"
                        width={55}
                        height={95}
                        className="arrow arrow-minus"
                        onClick={() => handleNavigation("left")}
                    />
                    <Image
                        src="/Arrow2.svg"
                        alt="Arrow"
                        width={55}
                        height={95}
                        className="arrow arrow-plus"
                        onClick={() => handleNavigation("right")}
                    />
                </div>
                <div className="upload-btn">
                    <button onClick={handleFileUploadToServer}>Завантажити файл</button>
                </div>
            </div>

            {/* Правая часть - Результат */}
            <div className="result">
            <div className="box box-result">
            {resultFiles.length === 0 ? (
                    <p>Результат відобразиться тут</p>
                ) : isImage(resultFiles[resultIndex]) ? (
                    <img
                        src={URL.createObjectURL(resultFiles[resultIndex])}
                        alt="Result Preview"
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                ) : isVideo(resultFiles[resultIndex]) ? (
                    (() => {
                        const file = resultFiles[resultIndex];
                        if (file && file instanceof Blob) {
                            const objectURL = URL.createObjectURL(file);
                            return <video src={objectURL} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />;
                        } else {
                            console.error("Файл не является Blob или File.");
                            return <p>Ошибка загрузки видео</p>;
                        }
                    })()
                ) : (
                    <p>Файл не підтримується</p>
                )}
            </div>
                <div className="result-arrows">
                    <Image
                        src="/Arrow1.svg"
                        alt="Arrow"
                        width={55}
                        height={95}
                        className="arrow arrow-minus"
                        onClick={() => handleNavigation("left", true)}
                    />
                    <Image
                        src="/Arrow2.svg"
                        alt="Arrow"
                        width={55}
                        height={95}
                        className="arrow arrow-plus"
                        onClick={() => handleNavigation("right", true)}
                    />
                </div>
                <div className="result-btn">
                    <button onClick={downloadOriginalArchive}>Скачати zip архів</button>
                </div>
            </div>
        </div>
    );
}
