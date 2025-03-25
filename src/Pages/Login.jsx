import { Form, Button, Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../App.css"

const Login = () => {
    const navigate = useNavigate();
    const [loginDetails, setLoginDetails] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleLoginDetails = (e) => {
        setLoginDetails({...loginDetails, [e.target.name]: e.target.value});
    }

    const handleLoginSubmit = async(e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        const {email, password} = loginDetails;
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/dashboard");
        } catch(err) {
            console.log(err);
            setError("Failed to log in. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="login-container">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card className="login-card">
                            <div className="login-form-container">
                                <h2 className="login-header">Login to Your Account</h2>
                                
                                {error && <Alert variant="danger">{error}</Alert>}
                                
                                <Form onSubmit={handleLoginSubmit}>
                                    <Form.Group className="form-group">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control 
                                            type="email" 
                                            name="email" 
                                            placeholder="Enter your email"
                                            onChange={handleLoginDetails} 
                                            required
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group className="form-group">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control 
                                            type="password"  
                                            name="password" 
                                            placeholder="Enter your password"
                                            onChange={handleLoginDetails} 
                                            required
                                        />
                                    </Form.Group>
                                    
                                    <Button 
                                        className="login-button"
                                        type="submit" 
                                        disabled={loading}
                                    >
                                        {loading ? "Logging in..." : "Login"}
                                    </Button>
                                </Form>
                                
                                <div className="login-links">
                                    <p>
                                        Don't have an account? <a href="/signup">Sign up</a>
                                    </p>
                                    <p>
                                        <a href="/forgot-password">Forgot password?</a>
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Login;