export default function World({ fast = false }) {
  return (
    <>
      <div className="sky-bg" />
      <div className="sun-bg" />
      <div className="player-light cyan" />
      <div className="player-light pink" />
      <div className="grid-bg">
        <div className={`grid-bg-inner grid-fast`} />
      </div>
    </>
  );
}
