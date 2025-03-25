import { Form, Button, Container, Row, Col, Card, Alert } from "react-bootstrap";
import { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { set, ref } from "firebase/database";
import "../App.css"
const SignUp = () => {
    const navigate = useNavigate();
    const [signupDetails, setSignupDetails] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    
    const handleSignUpDetails = (e) => {
        setSignupDetails({ ...signupDetails, [e.target.name]: e.target.value });
    };
    
    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        const { name, email, password } = signupDetails; 
        
        try {
            const signUpUser = await createUserWithEmailAndPassword(auth, email, password);
            
            await set(ref(db, "users/" + name), {
                name: name,
                email: email,
                id: signUpUser.user.uid,
            });
            
            navigate("/login");
        } catch (err) {
            console.log(err);
            setError("Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="signup-container">
            <Container>
                <Row className="justify-content-center">
                    <Col md={6} lg={5}>
                        <Card className="signup-card">
                            <div className="signup-form-container">
                                <h2 className="signup-header">Create an Account</h2>
                                
                                {error && <Alert variant="danger">{error}</Alert>}
                                
                                <Form onSubmit={handleSignUpSubmit}>
                                    <Form.Group className="form-group">
                                        <Form.Label>Name</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="name" 
                                            placeholder="Enter your name"
                                            onChange={handleSignUpDetails} 
                                            required
                                        />
                                    </Form.Group>
                                    
                                    
                                    <Form.Group className="form-group">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control 
                                            type="email" 
                                            name="email" 
                                            placeholder="Enter your email"
                                            onChange={handleSignUpDetails} 
                                            required
                                        />
                                    </Form.Group>
                                    
                                    <Form.Group className="form-group">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control 
                                            type="password" 
                                            name="password" 
                                            placeholder="Create a password"
                                            onChange={handleSignUpDetails} 
                                            required
                                        />
                                    </Form.Group>
                                    
                                    <Button 
                                        className="signup-button"
                                        type="submit" 
                                        disabled={loading}
                                    >
                                        {loading ? "Creating Account..." : "Sign Up"}
                                    </Button>
                                </Form>
                                
                                <div className="signup-links">
                                    <p>
                                        Already have an account? <a href="/login">Login</a>
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default SignUp;