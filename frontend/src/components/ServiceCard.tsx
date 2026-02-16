const ServiceCard = ({ service, onBook }: any) => {
  return (
    <div className="service-card">
      <h4>{service.name}</h4>
      <p>Category: {service.category}</p>
      <p>Provider: {service.providerName}</p>
      <p>Contact: {service.contact}</p>
      {onBook && <button onClick={() => onBook(service._id)}>Book</button>}
    </div>
  );
};

export default ServiceCard;
