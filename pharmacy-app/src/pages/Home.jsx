import Navbar from "../components/Navbar";
import MedicineCard from "../components/MedicineCard";

function Home() {

  const medicines = [

    {
      id: 1,
      name: "Paracetamol",
      price: 50,
      image:
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88"
    },

    {
      id: 2,
      name: "Vitamin C",
      price: 120,
      image:
        "https://images.unsplash.com/photo-1584017911766-d451b3d0e843"
    }

  ];

  return (

    <div>

      <Navbar />

      <div className="hero">

        <h1>Order Medicines Online</h1>

        <input
          type="text"
          placeholder="Search Medicines"
          className="search"
        />

      </div>

      <div className="products">

        {
          medicines.map((item) => (

            <MedicineCard
              key={item.id}
              name={item.name}
              price={item.price}
              image={item.image}
            />

          ))
        }

      </div>

    </div>
  );
}

export default Home;