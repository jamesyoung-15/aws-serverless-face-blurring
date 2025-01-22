import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from '@fortawesome/free-brands-svg-icons'


const Footer = () => {

    return (
        <footer className="footer mt-4">
            <div className="content has-text-centered">
                <p>
                    <strong>Serverless Face Blurring Application</strong> by James Young.
                </p>
                <p>
                    <span className="footer-gh">
                        See the source code
                    </span>
                    <a
                    className="button is-small"
                    href="https://github.com/jamesyoung-15/aws-serverless-face-blurring"
                    target="_blank"
                    >
                        <span className="icon-text">
                            <FontAwesomeIcon icon={faGithub} />
                        </span>
                    </a>
                </p>
            </div>
      </footer>
    )
}
  
export default Footer