import styles from "./aboutStyle.module.css";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className={styles.about}>
      <h2>
        Sobre tiny<span>Yellow</span>
      </h2>
      <p>Besterada sobre o projeto</p>
      <Link to="/posts/create" className="btn">
        Criar post
      </Link>
    </div>
  );
};

export default About;
