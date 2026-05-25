import Navbar from "../components/Navbar";

function Login() {

  return (

    <div>

      <Navbar />

      <div className="login-container">

        <h2>Login</h2>

        <input
          type="email"
          placeholder="Enter Email"
        />

        <input
          type="password"
          placeholder="Enter Password"
        />

        <button>Login</button>

      </div>

    </div>
  );
}

export default Login;