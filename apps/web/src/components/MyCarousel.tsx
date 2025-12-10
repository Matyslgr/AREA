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
    <div className="relative w-full max-w-5xl mx-auto px-12">
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {featureImages.map((image, index) => (
            <CarouselItem
              key={index}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <div className="p-2">
                <div className={`relative overflow-hidden rounded-xl border transition-all duration-500 ${
                  current === index
                    ? "border-amber-500/50 shadow-xl shadow-amber-500/10 scale-105"
                    : "border-zinc-800 opacity-60 scale-95"
                }`}>
                  <img
                    src={image}
                    alt={`Feature ${index + 1}`}
                    className="w-full h-64 object-cover"
                  />
                  {current === index && (
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent" />
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white" />
        <CarouselNext className="right-0 bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white" />
      </Carousel>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {featureImages.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              current === index
                ? "bg-amber-400 w-6"
                : "bg-zinc-700 hover:bg-zinc-600"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
