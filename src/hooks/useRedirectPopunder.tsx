const oneHourMilliseconds = 1000 * 60 * 60;

function useRedirectPopunder() {
  const onClick = () => {
    const now = new Date().getTime();
    const stringLastOpen = localStorage.getItem("last-open");

    // first time here
    if (!stringLastOpen) {
      open();
      return;
    }

    // more than 1 hour
    const lastOpen = Number(stringLastOpen);
    if (now - lastOpen > oneHourMilliseconds) {
      open();
    }
  };

  const open = () => {
    const popUnder = window.open(
      "https://go.afrieirham.com/bukitjalilstadium",
      "_blank"
    );
    if (popUnder) window.focus();
    localStorage.setItem("last-open", String(new Date().getTime()));
  };

  return { onOpenPopunder: onClick };
}

export default useRedirectPopunder;
