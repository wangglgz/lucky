var React = require('react');

var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Panel = require('react-bootstrap/lib/Panel');
var PanelGroup = require('react-bootstrap/lib/PanelGroup');
var PageHeader = require('react-bootstrap/lib/PageHeader');
var Button = require('react-bootstrap/lib/Button');
var Well = require('react-bootstrap/lib/Well');
var Input = require('react-bootstrap/lib/Input');
var FormGroup = require('react-bootstrap/lib/FormGroup');

var io = require('socket.io-client');
var request = require('request');

var baseURL = window.location.protocol + "//" + window.location.host;

var Blockchain = React.createClass({
  getInitialState() {
    return {
      activeKey: '1',
      blocks: []
    };
  },

  componentDidMount: function() {
    this.getChain();
  },

  getChain: function() {
    var that = this;
    this.socket = io();
    this.socket.emit('chain');
    this.socket.on('chainResult', function (body) {
      var chain = body;

      var blocks = [];
      for (var i = 0; i < chain.length; i++) {
        var block = chain[i];
        blocks.unshift({
          id: i,
          attestation: block.attestation,
          hash: block.hash,
          luck: block.luck,
          parent: block.parent,
          transactions: block.transactions,
        });
      }

      that.setState({
        blocks: blocks
      });
    });
  },

  handleSelect(activeKey) {
    this.setState({ activeKey });
  },

  render: function() {
    return (
      <Panel>
        <PageHeader>Blockchain</PageHeader>
        <PanelGroup activeKey={this.state.activeKey} onSelect={this.handleSelect} accordion>
          {
            this.state.blocks.map((item, index) => {
              return (
                <Panel header={"Block " + item.id + ": " + item.hash} eventKey={item.id} key={item.id}>
                  <p><strong>Luck:</strong> {item.luck}</p>
                  <p><strong>Parent:</strong> {item.parent}</p>
                  <p><strong>Attestation:</strong> {JSON.stringify(item.attestation, null, 2)}</p>
                  <p><strong>Transactions:</strong>
                    {
                      item.transactions.map((tx) => {
                        return (<p>{tx.hash}</p>);
                      })
                    }
                  </p>
                </Panel>
              );
            })
          }
        </PanelGroup>
      </Panel>
    );
  }
});

var Publish = React.createClass({
  getInitialState() {
    return {
      value: ''
    };
  },

  handleChange(e) {
    this.setState({ value: e.target.value });
  },

  submitTransaction: function() {
    var transaction = {
      tx: {
        Data: this.state.value
      }
    };

    var that = this;
    request({
      url: baseURL + '/tx', 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    }, function(error, response, body) {
      if (response.statusCode === 200) {
        document.location.href = '/';
      }
    });
  },

  render: function() {
    return (
      <Panel>
        <PageHeader>Publish</PageHeader>
        <form>
          <FormGroup controlId="formControlsTextarea">
            <Input type="text" componentClass="textarea" value={this.state.value} onChange={this.handleChange} label='Transaction' />
          </FormGroup>
          <FormGroup>
            <center>
              <Button type="submit" onClick={this.submitTransaction}>
                Submit Transaction
              </Button>
            </center>
          </FormGroup>
        </form>
      </Panel>
    );
  }
});

var Peers = React.createClass({
  getInitialState() {
    return {
      peers: []
    };
  },

  componentDidMount: function() {
    this.getPeers();
  },

  getPeers: function() {
    var that = this;
    this.socket = io();
    this.socket.emit('peers');
    this.socket.on('peersResult', function (body) {
      var peers = [];
      for (var i = 0; i < body.length; i++) {
        peers.push({ id: i, address: body[i] });
      }

      that.setState({ peers: peers });
    });
  },

  render: function() {
    return (
      <Panel>
        <PageHeader>Peers</PageHeader>
        {
          this.state.peers.map((item) => {
            return (
              <Well key={item.id}>
                <h4>Peer {item.id}</h4>
                <p>{item.address}</p>
              </Well>
            );
          })
        }
      </Panel>
    );
  }
});

var Index = React.createClass({
  render: function() {
    return (
      <div>
        <Col md={7} lg={7} xl={7}>
          <Blockchain />
        </Col>
        <Col md={5} lg={5} xl={5}>
         <Publish />
         <Peers />
        </Col>
      </div>
    );
  }
});

module.exports = Index;