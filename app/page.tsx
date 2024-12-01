'use client';
import "./styles/globals.scss";
import "./styles/Home.scss";
import "./styles/Button.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const buttonClickLink = () => {
    router.push("/upload");
  };

  return (
    <div className="container">
      <Image
        src="/Scooter-man.png"
        alt="Scooter"
        width={659}    
        height={920}   
        className="img"
      />

      <div className="container-text">
        <div className="text-top">Детектування та відстежування електросамокатів</div>
        <div className="text-main">
          Веб-дотаток дозволить збільшити безпеку на дорогах та тротуарах шляхом відстеження відстеження водіїв електросамокатів у транспортному потоці міста
        </div>
        <button className="btn" onClick={(buttonClickLink)}>Розпочати</button>
      </div>
    </div>
  );
}