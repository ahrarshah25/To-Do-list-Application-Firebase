import { getDoc, db, doc } from "../Firebase/config.js";

const handleRedirect = async (userId) => {
  const snap = await getDoc(doc(db, "users", userId));

  if (!snap.exists()) {
    return;
  }

  const data = snap.data();
  console.log(data);
  

  if (data.isVerified === false) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "question",
      title: "Not Verified Yet.",
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: "swal-margin-top",
      },
    });
    return;
  }

  if (data.role === "admin") {
    Swal.fire("Welcome Admin", "Welcome Dear Admin To TaskFlow", "success").then(()=>{window.location.href = "/admin"})
  } else {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Welcome User.",
      showConfirmButton: false,
      timer: 2000,
      customClass: {
        popup: "swal-margin-top",
      },
    });
    window.location.href = "/dashboard";
  }
};

export default handleRedirect;