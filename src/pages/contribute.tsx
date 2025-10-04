import { useRouter } from "next/router";
import { useEffect } from "react";

function Contribute() {
  const router = useRouter();
  useEffect(() => {
    router.push("https://go.afrieirham.com/contribute");
  }, []);
  return null;
}

export default Contribute;
