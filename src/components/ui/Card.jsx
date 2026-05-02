const Card = ({ children, className = '', style = {} }) => {
  return (
    <div 
      className={`glass-panel ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
