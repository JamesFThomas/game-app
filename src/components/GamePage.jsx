import React from 'react';
import {
  MDBCarousel, MDBCarouselCaption, MDBCarouselInner,
  MDBCarouselItem, MDBView, MDBContainer,
} from 'mdbreact';
import asteroids from '../assets/asteroids.gif';
import starhunter from '../assets/starhunter.gif';
import starcollecter from '../assets/starcollecter.gif';
import breakout from '../assets/BREAKOUT.gif';
import slimes from '../assets/slimes.gif';

const GamePage = () => (
  <MDBContainer>
    <MDBCarousel
      activeItem={1}
      length={5}
      // eslint-disable-next-line react/jsx-boolean-value
      showControls={true}
      // eslint-disable-next-line react/jsx-boolean-value
      showIndicators={true}
      className="z-depth-1"
    >
      <MDBCarouselInner>

        <MDBCarouselItem itemId="1">
          <MDBView>
            <img src={asteroids} alt="First slide" className="mx-auto d-block" />
          </MDBView>
          <MDBCarouselCaption>
            {/* <MDBLink to="/gameone"> Space Blaster </MDBLink> */}
            <a href="/gameone">Space Blaster</a>
          </MDBCarouselCaption>
        </MDBCarouselItem>

        <MDBCarouselItem itemId="2">
          <MDBView>
            <img src={starhunter} alt="Second slide" className="mx-auto d-block" />
          </MDBView>
          <MDBCarouselCaption>
            <a href="/multiplayer">Star Hunter</a>
          </MDBCarouselCaption>
        </MDBCarouselItem>

        <MDBCarouselItem itemId="3">
          <MDBView>
            <img src={starcollecter} alt="Third slide" className="mx-auto d-block" />
          </MDBView>
          <MDBCarouselCaption>
            <a href="/gamethree">Star Pickup</a>
          </MDBCarouselCaption>
        </MDBCarouselItem>

        <MDBCarouselItem itemId="4">
          <MDBView>
            <img src={breakout} alt="Fourth slide" className="mx-auto d-block" />
          </MDBView>
          <MDBCarouselCaption>
            <a href="/breakout">Break Out</a>
          </MDBCarouselCaption>
        </MDBCarouselItem>

        <MDBCarouselItem itemId="5">
          <MDBView>
            <img src={slimes} alt="Fifth slide" className="mx-auto d-block" />
          </MDBView>
          <MDBCarouselCaption>
            <a href="/germs">Germs</a>
          </MDBCarouselCaption>
        </MDBCarouselItem>
      </MDBCarouselInner>
    </MDBCarousel>
  </MDBContainer>
);

export default GamePage;
