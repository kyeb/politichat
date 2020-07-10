import React, { Component } from "react";
import {
  Button,
  Container,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  List,
  Menu,
  Responsive,
  Segment,
  Sidebar,
  Visibility,
} from "semantic-ui-react";

import Kye from "../../assets/kye.jpg";
import Daniel from "../../assets/daniel.jpg";
import Sabrina from "../../assets/sabrina.jpg";
import Screenshot from "../../assets/screenshot.png";

const getWidth = () => {
  return window.innerWidth;
};

/* Heads up! HomepageHeading uses inline styling, however it's not the best practice. Use CSS or styled components for
 * such things.
 */
const HomepageHeading = ({ mobile }) => (
  <Container text>
    <Header
      inverted
      style={{
        fontSize: mobile ? "2em" : "4em",
        fontWeight: "normal",
        marginBottom: 0,
        marginTop: mobile ? "1em" : "2em",
      }}
    >
      Politichat
    </Header>
    <Header
      inverted
      style={{
        fontSize: mobile ? "1.5em" : "1.7em",
        fontWeight: "normal",
        marginTop: mobile ? "0.5em" : "1.5em",
      }}
    >
      Seamless virtual 1-1 conversations between campaigns and constituents
    </Header>
    <Header
      inverted
      style={{
        fontSize: mobile ? "1.5em" : "1.7em",
        fontWeight: "normal",
        marginTop: mobile ? "0.66em" : "2em",
      }}
    >
      Continue as...
    </Header>
    <Button primary size="huge" href="/dashboard">
      Campaign
      <Icon name="right arrow" />
    </Button>
    <Button
      size="huge"
      style={{
        marginLeft: mobile ? "0.5em" : "1em",
      }}
      href="/dashboard"
    >
      Constituent
      <Icon name="right arrow" />
    </Button>
  </Container>
);

/* Heads up!
 * Neither Semantic UI nor Semantic UI React offer a responsive navbar, however, it can be implemented easily.
 * It can be more complicated, but you can create really flexible markup.
 */
class DesktopContainer extends Component {
  state = {};

  hideFixedMenu = () => this.setState({ fixed: false });
  showFixedMenu = () => this.setState({ fixed: true });

  render() {
    const { children } = this.props;
    const { fixed } = this.state;

    return (
      <Responsive getWidth={getWidth} minWidth={Responsive.onlyTablet.minWidth}>
        <Visibility
          once={false}
          onBottomPassed={this.showFixedMenu}
          onBottomPassedReverse={this.hideFixedMenu}
        >
          <Segment
            inverted
            textAlign="center"
            style={{ minHeight: 700, padding: "1em 0em" }}
            vertical
          >
            <Menu
              fixed={fixed ? "top" : null}
              inverted={!fixed}
              pointing={!fixed}
              secondary={!fixed}
              size="large"
            >
              <Container>
                <Menu.Item as="a" active>
                  Home
                </Menu.Item>
                {/* TODO: handle highlighting these correctly */}
                <Menu.Item as="a" href="#product">
                  Product
                </Menu.Item>
                <Menu.Item as="a" href="#team">
                  Team
                </Menu.Item>
                <Menu.Item position="right">
                  <Button as="a" inverted={!fixed} href="/dashboard">
                    Log in
                  </Button>
                  <Button
                    as="a"
                    inverted={!fixed}
                    primary={fixed}
                    style={{ marginLeft: "0.5em" }}
                    href="/dashboard"
                  >
                    Sign Up
                  </Button>
                </Menu.Item>
              </Container>
            </Menu>
            <HomepageHeading />
          </Segment>
        </Visibility>

        {children}
      </Responsive>
    );
  }
}

class MobileContainer extends Component {
  state = {};

  handleSidebarHide = () => this.setState({ sidebarOpened: false });

  handleToggle = () => this.setState({ sidebarOpened: true });

  render() {
    const { children } = this.props;
    const { sidebarOpened } = this.state;

    return (
      <Responsive
        as={Sidebar.Pushable}
        getWidth={getWidth}
        maxWidth={Responsive.onlyMobile.maxWidth}
      >
        <Sidebar
          as={Menu}
          animation="push"
          inverted
          onHide={this.handleSidebarHide}
          vertical
          visible={sidebarOpened}
        >
          <Menu.Item as="a" active>
            Home
          </Menu.Item>
          <Menu.Item as="a">Product</Menu.Item>
          <Menu.Item as="a">Team</Menu.Item>
          <Menu.Item as="a">Log in</Menu.Item>
          <Menu.Item as="a">Sign Up</Menu.Item>
        </Sidebar>

        <Sidebar.Pusher dimmed={sidebarOpened}>
          <Segment
            inverted
            textAlign="center"
            style={{ minHeight: 350, padding: "1em 0em" }}
            vertical
          >
            <Container>
              <Menu inverted pointing secondary size="large">
                <Menu.Item onClick={this.handleToggle}>
                  <Icon name="sidebar" />
                </Menu.Item>
                <Menu.Item position="right">
                  <Button as="a" inverted>
                    Log in
                  </Button>
                  <Button as="a" inverted style={{ marginLeft: "0.5em" }}>
                    Sign Up
                  </Button>
                </Menu.Item>
              </Menu>
            </Container>
            <HomepageHeading mobile />
          </Segment>

          {children}
        </Sidebar.Pusher>
      </Responsive>
    );
  }
}

const ResponsiveContainer = ({ children }) => (
  <div>
    <DesktopContainer>{children}</DesktopContainer>
    <MobileContainer>{children}</MobileContainer>
  </div>
);

const HomepageLayout = () => (
  <ResponsiveContainer>
    <div id="product">
      <Segment style={{ padding: "8em 0em" }} vertical>
        <Grid container stackable verticalAlign="middle">
          <Grid.Row>
            <Grid.Column width={6}>
              <Header as="h3" style={{ fontSize: "2em" }}>
                Driving personal campaign communications in the age of COVID-19
              </Header>
              <p style={{ fontSize: "1.2em" }}>
                Politichat is a queue-style video chat platform where constituents can virtually
                line up to speak with a candidate, allowing candidates to have personal, virtual
                conversations that support their campaigns. We fill the technology gap between
                large, impersonal livestreamed virtual rallies and low-throughput, high-impact
                individual conversations.
              </p>
            </Grid.Column>
            <Grid.Column floated="right" width={8}>
              <Image bordered rounded fluid src={Screenshot} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column textAlign="center">
              <Button size="huge" href="/dashboard">
                Get Started
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>

    <Segment style={{ padding: "8em 0em" }} vertical>
      <Container text>
        <Header as="h3" style={{ fontSize: "2em" }}>
          Why Politichat?
        </Header>
        <p style={{ fontSize: "1.33em" }}>
          Connecting with constituents is of the utmost importance for political campaigns.
        </p>
        <p>
          As digital technology and social media become increasingly pervasive, campaigns are
          exploring more ways to connect with constituents online.
        </p>
        <p>
          At the same time, modern political discourse is threatened by the idea of political
          elitism and disconnect with the problems of the everyday American. We believe that
          intimate 1-1 conversations are essential to maintaining understanding on both sides. These
          personal conversations especially affect down-ballot candidates who don’t enjoy the
          advantage of widespread name recognition.
        </p>
        <p>
          Finally, we’ve all seen the drastic societal changes mandated as a response to COVID-19.
          In a time where most human interaction has moved online, livestreams and Zoom calls have
          taken the place of rallies and town halls. Politichat is the last of the digital tech
          communication triad - cultivating the individual conversations crucial to voter turnout.
        </p>
        <Divider
          as="h4"
          className="header"
          horizontal
          style={{ margin: "3em 0em", textTransform: "uppercase" }}
        >
          <a href="https://medium.com/hcs-builders-incubation-program/introducing-politichat-ccf2afbf99bb">
            Read our Harvard BIP blog post
          </a>
        </Divider>
        <Header as="h3" style={{ fontSize: "2em" }}>
          But what is it?
        </Header>
        <p style={{ fontSize: "1.33em" }}>
          We built a platform where constituents can virtually “line up” to speak 1-on-1 with a
          candidate, allowing them to have individual conversations that support their campaigns.
        </p>
        <p>
          With Politichat, campaigns can hold online events such as “Coffee with the Candidate,”
          office hours, or donor appreciation calls. The process is simple and easy on the
          campaign’s side, and allows for event publicization and constituent information
          collection.
        </p>
        <p>
          On the user side, Politichat offers a streamlined experience - no download or complexity
          involved.
        </p>
        <p>
          We are constantly iterating and committed to providing the best experience possible, so
          please reach out to us at politichat@mit.edu with any questions, feedback, or requests.
        </p>
        <Button as="a" size="large" href="/dashboard">
          Get started
        </Button>
      </Container>
    </Segment>

    <div id="team">
      <Segment style={{ padding: "2em" }} vertical>
        <Container text>
          <Header style={{ fontSize: "2em" }}>The team</Header>
        </Container>
        <Grid columns="equal" stackable>
          <Grid.Row textAlign="center">
            <Grid.Column style={{ paddingBottom: "5em", paddingTop: "5em" }}>
              <Image circular centered size="medium" src={Kye} />
              <Header as="h3" style={{ fontSize: "2em" }}>
                Kye Burchard
              </Header>
              Kye is a rising senior at MIT studying Electrical Engineering and Computer Science
              passionate about using his skills to create real, positive change in the world.
              Previously, he has served as logistics head for HackMIT, president of Maseeh Hall, and
              operations chair for web.lab. When he’s not at his computer, you’ll find him hiking,
              mountain biking, skiing, or just generally exploring wherever he is at the moment. He
              has been spending inordinate amounts of time staring at the performance tab in the
              Chrome DevTools over the past few weeks.
            </Grid.Column>
            <Grid.Column style={{ paddingBottom: "5em", paddingTop: "5em" }}>
              <Image circular centered size="medium" src={Sabrina} />
              <Header as="h3" style={{ fontSize: "2em" }}>
                Sabrina Chern
              </Header>
              Sabrina is a rising second-semester senior studying Chemistry and Physics who loves
              exploring the potential of technology in quantum physics and politics. On campus, she
              is involved with research and enjoys being a resource advocate for the Harvard Square
              Homeless Shelter. Sabrina has experience in physics research at Harvard, Princeton,
              and IBM, as well as political campaign experience in New Hampshire for the 2020
              Democratic primary. She has lately been attempting to skateboard on flat surfaces.
            </Grid.Column>
            <Grid.Column style={{ paddingBottom: "5em", paddingTop: "5em" }}>
              <Image circular centered size="medium" src={Daniel} />
              <Header as="h3" style={{ fontSize: "2em" }}>
                Daniel Chiu
              </Header>
              Daniel is a rising senior majoring in Computer Science, with a particular focus the
              responsible use of technology to make the world a better place. Outside of classes, he
              is involved with Datamatch, the competitive programming club, and the quantitative
              analysts club. He has had numerous industry experiences at Asana, Quora, Figma, and
              Jane Street Capital, and is always looking for opportunities to grow. In leisure, he
              enjoys introducing and playing obscure card games.
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </div>

    <Segment vertical style={{ padding: "5em 0em" }}></Segment>
  </ResponsiveContainer>
);

export default HomepageLayout;
