import React from 'react';
import ViewBase from '../../view-base';
import ViewModel from '../../view-model';
import ParticipantBox from '../../roomControls/participant-box';
import './room-view.css';


class RoomView extends ViewBase
{
    handleWhatsappShareClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    handleStartClick()
    {
        //TODO
        // ViewModel.GoTo("/create");
    }

    render() 
    {
        return (
            <div className="view room-view">
            </div>
        );
    }
}

export default RoomView;