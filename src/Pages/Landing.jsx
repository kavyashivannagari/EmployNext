import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import React from 'react';
import { Link } from 'react-router-dom';
import Companies from "../Data/Companies.json";
import Autoplay  from "embla-carousel-autoplay"
import { Card,CardHeader,CardTitle,CardContent} from '@/components/ui/card';

const LandingPage = () => {
  return (
    <main className='flex flex-col gap-10 sm:gap-20 py-10 sm:py-20'>
      <section className='text-center'>
        <h1 className='flex flex-col items-center justify-center gradient-title text-4xl font-extrabold sm:text-6xl lg:text-8xl'>Find Your Dream Job
          <span className='flex items-center'>with{" "}
            <img
              src='/Logo.png'
              alt='logo'
              className='h-14 sm:h-24 lg:h-32 ml-2'
            />
          </span>
        </h1>
        <p className='text-gray-300 sm:mt-4 text-xs sm:text-xl'>Explore thousands of job Listings and connect your talent with Opportunities</p>
      </section>
      <div className='flex gap-6 justify-center'>
        <Link to="/jobs">
          <Button variant="secondary" size="xl">Find Jobs</Button>
        </Link>
        <Link to="/postjob">
          <Button variant="destructive" size="xl">Post Jobs</Button>
        </Link>
      </div>
      {/* carousel */}
      <Carousel plugins={[Autoplay({ delay: 1000 })]}
  className="w-full py-10"
  opts={{
    align: "start",
    loop: true,
    slidesToScroll: 1,
    dragFree: true, // Optional: Enable smooth scrolling
  }}
>
  <CarouselContent className="flex gap-5 sm:gap-20 items-center">
    {Companies.map(({name, path, id}) => (
      <CarouselItem key={id} className="pl-1 md:basis-1/3 lg:basis-1/6 flex-none ">
        <div className="p-1">
          <img 
            src={path} 
            alt={name} 
            className="h-9  sm:h-14 object-contain mx-auto"
          />
        </div>
      </CarouselItem>
    ))}
  </CarouselContent>
</Carousel>

      <section className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <Card>
  <CardHeader>
    <CardTitle className='font-bold'>For Job Seekers</CardTitle>
  </CardHeader>
  <CardContent>
    Search and apply for jobs,track applications,and more
  </CardContent>
</Card>
<Card>
  <CardHeader>
    <CardTitle className='font-bold'>For Recruiters</CardTitle>
  </CardHeader>
  <CardContent>
    Post Jobs,manage applications and find the best
  </CardContent>
</Card>

      </section>
    </main>
  )
}

export default LandingPage;