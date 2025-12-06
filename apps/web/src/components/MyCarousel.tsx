import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { type CarouselApi } from "@/components/ui/carousel"
import { useEffect, useState } from "react"

import feature1 from "@/assets/feature1.jpeg"
import feature2 from "@/assets/feature2.jpeg"
import feature3 from "@/assets/feature3.jpeg"
import feature4 from "@/assets/feature4.jpeg"
import feature5 from "@/assets/feature5.jpeg"

const featureImages = [
  feature1,
  feature2,
  feature3,
  feature4,
  feature5,
];

export function MyCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap())
    }

    api.on("select", onSelect)

    return () => {
      api.off("select", onSelect)
    }
  }, [api])

  return (
    <div className="carousel-container">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        setApi={setApi}
        className="carousel-wrapper"
      >
        <CarouselContent className="carousel-content">
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem
              key={index}
              className="carousel-item"
            >
              <div className="carousel-item-inner">
                <img
                  src={featureImages[index]}
                  alt={`Feature ${index + 1}`}
                  className={`carousel-image ${
                    current === index
                      ? "carousel-image-active"
                      : "carousel-image-inactive"
                  }`}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="carousel-previous" />
        <CarouselNext className="carousel-next" />
      </Carousel>
    </div>
  )
}
