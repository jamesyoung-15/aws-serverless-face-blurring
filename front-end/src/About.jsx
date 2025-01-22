import Header from "./Header"
import Footer from "./Footer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGithub } from '@fortawesome/free-brands-svg-icons'


const About = () => {
    return (
        <>
            <Header></Header>
            <main className="hero">
                <div className="hero-body">
                    <div className="content has-text-centered is-medium">
                        <h2>About the Project</h2>
                        <p>
                            Serverless project where users can upload images and the 
                            faces on the images will be automatically detected and blurred.
                            Small personal project mainly for practice and learning.
                        </p>
                        <p>
                            I have also created a self-hosted version (no cloud services) before using open-source alternatives.
                            See <a href="https://github.com/jamesyoung-15/serverless-face-blurring" target="_blank">here</a>.
                        </p>
                        <h4>Tech Stack</h4>
                        <p>
                            Focused on using core AWS services, Terraform, and Github Action.
                        </p>
                        <table className="table is-bordered mx-auto">
                            <tbody>
                                <tr>
                                    <th>Function</th>
                                    <th>Stack</th>
                                </tr>
                                <tr>
                                    <td>Front-End</td>
                                    <td>ReactJS</td>
                                </tr>
                                <tr>
                                    <td>Middleware</td>
                                    <td>API Gateway, Lambda (Python)</td>
                                </tr>
                                <tr>
                                    <td>Backend</td>
                                    <td>Lambda (Python w/ Pillow), S3, DynamoDB</td>
                                </tr>
                                <tr>
                                    <td>CI/CD</td>
                                    <td>Github Action</td>
                                </tr>
                                <tr>
                                    <td>AWS IaC</td>
                                    <td>Terraform</td>
                                </tr>

                            </tbody>
                        </table>
                        <h4>Diagram</h4>
                        <div className="container">
                            <figure className="image is-5by3 mx-1">
                                <img src="https://raw.githubusercontent.com/jamesyoung-15/aws-serverless-face-blurring/refs/heads/main/media/Diagram.drawio.png" />
                            </figure>
                        </div>
                        <a href="https://github.com/jamesyoung-15/aws-serverless-face-blurring" target="_blank" className="button mt-5">
                            <FontAwesomeIcon className="icon" icon={faGithub}/>
                            <span className="ml-2">Code and details in Github Repo</span>
                        </a>
                    </div>
                    
                </div>
            </main>
            <Footer></Footer>

        </>
    )
}

export default About