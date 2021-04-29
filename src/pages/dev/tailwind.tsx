const TailwindPlayground = (): React.ReactElement => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="...">1</div>
      <div className="...">2</div>
      <div className="...">3</div>
      <div className="col-span-2 ...">4</div>
      <div className="...">5</div>
      <div className="...">6</div>
      <div className="col-span-2 ...">7</div>
    </div>
  );
};

export default TailwindPlayground;
