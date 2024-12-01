'use client';
import "../styles/globals.scss";
import "../styles/Upload.scss";
import "../styles/Button.scss";
import Image from "next/image";
import { useState, useRef } from "react";
import axios from "axios";

export default function Upload() {
    // Храним файлы с типом File[]
    const [files, setFiles] = useState<File[]>([]); 
    const [currentIndex, setCurrentIndex] = useState(0); 
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Обработчик загрузки файлов
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const uploadedFiles = Array.from(event.target.files); // Преобразуем FileList в массив
            setFiles(uploadedFiles); // Устанавливаем файлы в состояние
            setCurrentIndex(0); // Сбрасываем индекс на первый файл
        }
    };

    // Обработчик переключения между изображениями и видео
    const handleNavigation = (direction: "right" | "left") => {
        const totalPages = files.length;
        if (totalPages === 0) return;

        if (direction === "right") {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages);
        } else if (direction === "left") {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + totalPages) % totalPages);
        }
    };

    // Открытие диалога выбора файлов
    const handleBoxClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Функция для проверки, является ли файл изображением
    const isImage = (file: File) => {
        return file.type.startsWith("image/");
    };

    // Функция для проверки, является ли файл видео
    const isVideo = (file: File) => {
        return file.type.startsWith("video/");
    };

    const handleFileUploadToServer = async () => {
        if (files.length === 0) {
            alert("Завантажте файли перед відправкою.");
            return;
        }
    
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file); // Ключ "files" должен совпадать с FastAPI
        });
    
        try {
            const response = await axios.post("http://127.0.0.1:8080/upload_media", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                responseType: "blob", // Указываем тип для загрузки zip-архива
            });
    
            // Скачиваем zip-архив
            const blob = new Blob([response.data], { type: "application/zip" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "processed_files.zip";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Ошибка при отправке файлов:", error);
            alert("Не удалось отправить файлы. Проверьте сервер.");
        }
    };

    return (
        <div className="container-upload-result">
            {/* Левая часть - Загрузка файлов */}
            <div className="upload">
                <div
                    className="box box-upload"
                    itemID="boxUpload"
                    onClick={handleBoxClick}
                >
                    {/* Если файлы загружены, показываем изображение или видео, иначе показываем текст */}
                    {files.length === 0 ? (
                        "Завантажте фото у форматі png, jpg або відео у форматі mp4"
                    ) : isImage(files[currentIndex]) ? (
                        <img
                            src={URL.createObjectURL(files[currentIndex])}
                            alt="Preview"
                            style={{
                                width: "100%",       
                                height: "100%",      
                                objectFit: "contain",
                            }}
                        />
                    ) : isVideo(files[currentIndex]) ? (
                        <video
                            src={URL.createObjectURL(files[currentIndex])}
                            controls
                            style={{
                                width: "100%",       
                                height: "100%",      
                                objectFit: "contain",
                            }}
                        />
                    ) : null}
                </div>

                {/* Скрытый input для выбора файлов */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, video/mp4"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                />

                {/* Стрелки для переключения */}
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

                <div className="upload-btn" itemID="uploadButton">
                    <button onClick={handleFileUploadToServer}>Завантажити файл</button>
                </div>
            </div>

            {/* Правая часть - Результат */}
            <div className="result">
                <div className="box box-result" itemID="boxResult">
                    <p>Результат</p>
                </div>

                <div className="result-arrows">
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

                <div className="result-btn" itemID="resultButton">
                    <button>Скачати zip-архів</button>
                </div>
            </div>
        </div>
    );
}
