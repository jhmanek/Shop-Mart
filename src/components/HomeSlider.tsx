"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image"; // ✅ import Next.js Image
import "swiper/css";
import "swiper/css/pagination";

const sliderImages = [
  {
    id: 1,
    src: "https://sdmntprwestus2.oaiusercontent.com/files/00000000-9320-61f8-a310-77c422a921f2/raw?se=2025-06-27T12%3A49%3A24Z&sp=r&sv=2024-08-04&sr=b&scid=656978fd-508e-562e-905a-48aaadfc4903&skoid=02b7f7b5-29f8-416a-aeb6-99464748559d&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-06-26T19%3A51%3A00Z&ske=2025-06-27T19%3A51%3A00Z&sks=b&skv=2024-08-04&sig=k1Vyl9HKqwIZAORwKAelAs4%2B7qRcdtBQQrbqt5aAC1o%3D",
    alt: "50% Discount - Yellow",
  },
  {
    id: 2,
    src: "/banner-1.jpg",
    alt: "Special Offer",
  },
  {
    id: 3,
    src: "https://img.freepik.com/free-vector/gradient-student-discount-label_52683-122369.jpg",
    alt: "Student Discount",
  },
  {
    id: 4,
    src: "https://static.vecteezy.com/system/resources/previews/001/381/216/large_2x/special-offer-sale-banner-with-megaphone-free-vector.jpg",
    alt: "Special Offer - Megaphone",
  },
  {
    id: 5,
    src: "https://static.vecteezy.com/system/resources/thumbnails/005/405/595/small_2x/special-offer-sale-banner-besign-discount-label-and-sticker-for-media-promotion-product-free-vector.jpg",
    alt: "Discount Label",
  },
];

export default function HomeSlider() {
  return (
    <div className="w-full max-w-8xl mx-auto px-4 sm:px-8 pt-4">
      <div className="relative w-full aspect-[16/6] sm:aspect-[16/5] md:aspect-[16/6] lg:aspect-[16/5] xl:aspect-[16/5] overflow-hidden rounded-xl shadow-md">
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 2500 }}
          pagination={{ clickable: true }}
          loop={true}
          className="w-full h-full"
        >
          {sliderImages.map((img) => (
            <SwiperSlide key={img.id}>
              <div className="relative w-full h-full">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-fill rounded-xl"
                  sizes="(max-width: 768px) 100vw, 100vw"
                  priority={img.id === 1} // preload first image
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
