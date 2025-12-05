import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const Register = () => {
  const navigate = useNavigate();
  const { doCreateUserWithEmailAndPassword } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) return;

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setIsRegistering(true);
    setErrorMessage("");

    try {
      await doCreateUserWithEmailAndPassword(name, email, password);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <section className="section text-white h-screen w-full flex items-center py-10">
      <div className="container mx-auto">
        <div className="flex items-center justify-center md:justify-between w-full">
          {/* RIGHT SIDE — FORM */}
          <div className="w-[80%] md:w-[65%] flex items-center justify-center">
            <div className="w-[550px] flex flex-col gap-12">
              {/* HEADER */}
              <div>
                <h1 className="text-[32px]  md:text-[50px] leading-tight">
                  Create an <span className="textGradient">Account</span>
                </h1>
              </div>

              {/* FORM */}
              <form onSubmit={onSubmit}>
                <div className="flex flex-col gap-7">
                  {/* username  */}
                  <input
                    className="py-2 text-[16px] font-bold w-full bg-transparent border-0 border-b-2 border-white/50
                    text-white placeholder:text-white outline-none placeholder:font-light
                    focus:border-b-white transition-colors"
                    placeholder="Username"
                    type="text"
                    autoComplete="username"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {/* EMAIL */}
                  <input
                    className="py-2 text-[16px] font-bold w-full bg-transparent border-0 border-b-2 border-white/50
                    text-white placeholder:text-white outline-none placeholder:font-light
                    focus:border-b-white transition-colors"
                    placeholder="Email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {/* PASSWORD */}
                  <input
                    className="py-2 text-[16px] font-bold w-full bg-transparent border-0 border-b-2 border-white/50
                    text-white placeholder:text-white outline-none placeholder:font-light
                    focus:border-b-white transition-colors"
                    placeholder="Password"
                    type="password"
                    autoComplete="new-password"
                    required
                    disabled={isRegistering}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  {/* CONFIRM PASSWORD */}
                  <input
                    className="py-2 text-[16px] font-bold w-full bg-transparent border-0 border-b-2 border-white/50
                    text-white placeholder:text-white outline-none placeholder:font-light
                    focus:border-b-white transition-colors"
                    placeholder="Confirm Password"
                    type="password"
                    autoComplete="off"
                    required
                    disabled={isRegistering}
                    value={confirmPassword}
                    onChange={(e) => setconfirmPassword(e.target.value)}
                  />

                  {/* ERROR */}
                  {errorMessage && (
                    <span className="font-bold text-sm text-red-600">
                      {errorMessage}
                    </span>
                  )}

                  {/* SUBMIT BUTTON */}
                  <button
                    className={`w-full p-3 rounded-full cursor-pointer text-[16px] ${
                      isRegistering
                        ? "bg-gray-300 cursor-not-allowed"
                        : "btnGradient hover:shadow-xl transition duration-300"
                    }`}
                    type="submit"
                    disabled={isRegistering}
                  >
                    {isRegistering
                      ? "Creating Account..."
                      : "Create An Account"}
                  </button>

                  {/* LOGIN LINK */}
                  <div className="text-center">
                    Have an account?{" "}
                    <span className="font-bold underline">
                      <Link to={"/login"}>Log In</Link>
                    </span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* LEFT SIDE IMAGE */}
          <div className="bg-Image2 w-[35%] md:h-screen hidden md:block"></div>
        </div>
      </div>
    </section>
  );
};

export default Register;
