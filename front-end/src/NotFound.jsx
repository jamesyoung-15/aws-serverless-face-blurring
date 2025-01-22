import Header from './Header'
import Footer from './Footer'

const NotFound = () => {
    return (
        <>
            <Header/>
                <main className="hero">
                    <div className="hero-body">
                    <div className="container has-text-centered pt-6">
                        <h1 className="title has-text-danger pt-6">404 Error</h1>
                        <h2 className="subtitle has-text-danger pt-3">
                        The page you are looking for doesn&lsquo;t seem to exist.
                        </h2>
                        <a href="/" className="button is-danger">Go back</a>
                    </div>
                    </div>
                </main>
            <Footer/>
        </>
    );
  };
  
  export default NotFound;