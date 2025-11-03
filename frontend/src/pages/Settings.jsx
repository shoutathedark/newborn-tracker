import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { LuArrowLeft } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const SettingsPage = () =>  {
  const [user, setUser] = useState({});
  const [babies, setBabies] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBabyModal, setShowBabyModal] = useState(false);
  const [selectedBaby, setSelectedBaby] = useState(null);

  const [userForm, setUserForm] = useState({
    name: "",
    oldPassword: "",
    newPassword: "",
  });

  const [babyForm, setBabyForm] = useState({
    name: "",
    dob: "",
    gender: "",
  });

  const navigate = useNavigate();

const handleBack = () => {
      navigate("/");
  };


  useEffect(() => {
    api.get("/user/action=profile").then((res) => setUser(res.data));
    api.get("/baby").then((res) => setBabies(res.data));
  }, []);

  const handleSaveUser = async () => {
    if(userForm.oldPassword && userForm.newPassword){
        await api.put("/user/action=update", {
        name: userForm.name,
        oldPassword: userForm.oldPassword,
        newPassword: userForm.newPassword, });
    }
    setShowUserModal(false);
  };

  const handleSaveBaby = async () => {
    await api.put(`/baby/${selectedBaby._id}`, babyForm);
    setShowBabyModal(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-y-4 space-y-6">

      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="clay-gentle bg-white/80 p-3"
        >
          <LuArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Settings
          </h2>
        </div>
      </div>
      {/* USER PROFILE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">User Profile</h2>
        <div className="space-y-1 text-gray-600">
          <p><span className="font-medium">Name:</span> {user.name}</p>
          <p><span className="font-medium">Email:</span> {user.email}</p>
        </div>
        <button
          onClick={() => {
            setUserForm({ name: user.name, oldPassword: "", newPassword: "" });
            setShowUserModal(true);
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Edit
        </button>
      </div>

      {/* BABY PROFILES SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Baby Profiles</h2>
        {babies.map((baby) => (
          <div
            key={baby._id}
            className="flex items-center justify-between border-b border-gray-100 py-3 last:border-none"
          >
            <div>
              <p className="font-medium text-gray-800">{baby.name}</p>
              <p className="text-sm text-gray-500">
                {baby.gender} • {baby.dob}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedBaby(baby);
                setBabyForm({
                  name: baby.name,
                  dob: baby.dob,
                  gender: baby.gender,
                });
                setShowBabyModal(true);
              }}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* USER EDIT MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Edit User</h3>

            <label className="block mb-2 text-sm font-medium text-gray-600">Name</label>
            <input
              type="text"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring focus:ring-blue-100"
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">Old Password</label>
            <input
              type="password"
              value={userForm.oldPassword}
              onChange={(e) => setUserForm({ ...userForm, oldPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring focus:ring-blue-100"
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">New Password</label>
            <input
              type="password"
              value={userForm.newPassword}
              onChange={(e) => setUserForm({ ...userForm, newPassword: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring focus:ring-blue-100"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BABY EDIT MODAL */}
      {showBabyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Edit Baby</h3>

            <label className="block mb-2 text-sm font-medium text-gray-600">Name</label>
            <input
              type="text"
              value={babyForm.name}
              onChange={(e) => setBabyForm({ ...babyForm, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring focus:ring-blue-100"
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">Date of Birth</label>
            <input
              type="date"
              value={babyForm.dob}
              onChange={(e) => setBabyForm({ ...babyForm, dob: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring focus:ring-blue-100"
            />

            <label className="block mb-2 text-sm font-medium text-gray-600">Gender</label>
            <select
              value={babyForm.gender}
              onChange={(e) => setBabyForm({ ...babyForm, gender: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 mb-3 focus:ring focus:ring-blue-100"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowBabyModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBaby}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;