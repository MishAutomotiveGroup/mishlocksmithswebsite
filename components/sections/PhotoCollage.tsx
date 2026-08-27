export default function PhotoCollage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
      <div className="aspect-[4/3] overflow-hidden rounded-lg">
        <img
          src="/images/job7.png"
          alt="Technician working on a vehicle door lock"
          className="w-full h-full object-cover object-top"
          loading="eager"
        />
      </div>
      <div className="aspect-[4/3] overflow-hidden rounded-lg">
        <img
          src="/images/job5.png"
          alt="Technician working on a vehicle door"
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
      </div>
    </div>
  );
}
