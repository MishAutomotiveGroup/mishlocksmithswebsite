export default function PhotoCollage() {
  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        <div className="col-span-2 aspect-[16/9] overflow-hidden rounded-lg">
          <img
            src="/images/homepage-hero.svg"
            alt="Mish Auto Locksmiths service vehicle"
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </div>
        <div className="col-span-1 overflow-hidden rounded-lg hidden md:block">
          <img
            src="/images/gallery-vehicle-side.png"
            alt="Mish Auto Locksmiths branded service vehicle"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src="/images/job7.png"
            alt="Technician working on a vehicle door lock"
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </div>
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src="/images/gallery-bottom-left.svg"
            alt="Mish Auto Locksmiths technician with service vehicle"
            className="w-full h-full object-cover object-center"
            loading="lazy"
          />
        </div>
        <div className="aspect-square overflow-hidden rounded-lg">
          <img
            src="/images/job5.png"
            alt="Technician working on a vehicle door"
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
