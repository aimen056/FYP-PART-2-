import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    dob: "",
    country: "Pakistan",
    city: "",
    diseases: [],
    wantsAlerts: false,
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch("https://airguard-f6mb.onrender.com/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch user data");
        }

        const data = await response.json();
        setFormData({
          name: data.name || "",
          email: data.email || "",
          contact: data.contact || "",
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : "",
          country: data.country || "Pakistan",
          city: data.city || "",
          diseases: data.diseases || [],
          wantsAlerts: data.wantsAlerts || false,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage(error.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (type === "checkbox") {
        if (name === "wantsAlerts") {
          return {
            ...prev,
            wantsAlerts: checked,
            ...(checked ? {} : { diseases: [] }),
          };
        } else if (name === "diseases") {
          return {
            ...prev,
            diseases: checked 
              ? [...prev.diseases, value] 
              : prev.diseases.filter((d) => d !== value),
          };
        }
      }
      return { ...prev, [name]: type === "checkbox" ? checked : value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch("https://airguard-f6mb.onrender.com/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const data = await response.json();
      setMessage("Profile updated successfully!");
      
      // Update local storage if email or name changed
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        localStorage.setItem("user", JSON.stringify({
          ...user,
          name: formData.name,
          email: formData.email
        }));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage(error.message || "Failed to update profile");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="pt-16 bg-background dark:bg-background dark:text-[#E4E4E7] min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-orange-400 to-green-900 p-6 text-white">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <p className="mt-2">Update your personal information and preferences</p>
        </div>
        
        <div className="p-6">
          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes("success") 
                ? "bg-green-100 text-green-700" 
                : "bg-red-100 text-red-700"
            }`}>
              {message}
            </div>
          )}
          
             
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-orange-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-orange-400"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-orange-400"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="wantsAlerts"
                  checked={formData.wantsAlerts}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-orange-400 focus:ring-orange-400 border-gray-300 rounded"
                />
                <span className="text-gray-700">I want to receive alerts</span>
              </label>
              
              {formData.wantsAlerts && (
                <div className="mt-4 space-y-4 pl-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Health Conditions</label>
                    {['Respiratory conditions', 'Cardiovascular disease', 'Chronic Diseases & Other Conditions'].map((disease) => (
                      <label key={disease} className="flex items-center space-x-2 mb-2">
                        <input
                          type="checkbox"
                          name="diseases"
                          value={disease}
                          checked={formData.diseases.includes(disease)}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-orange-400 focus:ring-orange-400 border-gray-300 rounded"
                        />
                        <span>{disease}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/userdashboard")}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-400 text-white rounded hover:bg-orange-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;