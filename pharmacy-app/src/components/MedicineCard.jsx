function MedicineCard(props) {

  return (

    <div className="card">

      <img
        src={props.image}
        alt="medicine"
        width="150"
      />

      <h3>{props.name}</h3>

      <p>₹ {props.price}</p>

      <button>Add to Cart</button>

    </div>
  );
}

export default MedicineCard;