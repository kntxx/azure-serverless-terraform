import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import { useEffect } from "react";
import { useState } from "react";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, userLoggedIn, doSignOut } = useAuth();

  const [visitorCount, setVisitorCount] = useState("...");

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(
          "https://kenta-serverless-app-xq4t.azurewebsites.net/api/visitorCounter"
        );
        if (response.ok) {
          const data = await response.json();
          setVisitorCount(data.count);
        }
      } catch (error) {
        console.error("Error fetching visitor count:", error);
      }
    };

    fetchCount();
  }, []);

  return (
    <section className="bigBgImage section h-screen flex items-center justify-center bg-Image p-5">
      <div className="flex items-center justify-center flex-col gap-5 text-center">
        {/* TEXT SECTION */}
        <div className="flex flex-col">
          <h1 className="text-[85px] text-white leading-none">Welcomeee</h1>

          <h3 className="text-[60px] text-white leading-tight mt-2">
            Hello{" "}
            <span className="textGradient text-[75px]">
              {currentUser?.displayName
                ? currentUser.displayName
                : currentUser?.email}
            </span>
            , you are now logged in.
          </h3>
        </div>
        {/* 🏆 VISITOR COUNTER UI 🏆 */}
        <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <p className="text-white text-xl">
            Visitor Count:{" "}
            <span className="font-bold textGradient text-2xl">
              {visitorCount}
            </span>
          </p>
        </div>

        {/* BUTTONS */}
        <div className="w-[50%] flex justify-center">
          {userLoggedIn ? (
            <>
              <button
                onClick={() => {
                  doSignOut().then(() => navigate("/login"));
                }}
                className="p-5 rounded-full cursor-pointer text-[16px] btnGradient w-[50%]"
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2 w-full">
              <Link
                className="w-full p-3 rounded-full cursor-pointer text-[16px] btnGradient text-center"
                to={"/login"}
              >
                Login
              </Link>

              <Link
                className="w-full p-3 rounded-full cursor-pointer text-[16px] btnGradient text-center"
                to={"/register"}
              >
                Register New Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Home;
