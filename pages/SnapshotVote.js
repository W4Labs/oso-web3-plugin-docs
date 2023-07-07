import { useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import * as React from "react";
import "../App.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Web3Button } from "@web3modal/react";
import { getSingleProposal, voteProposal } from "../helpers/snapshotHelpers";

export default function SnapshotVote() {
  const [searchParams] = useSearchParams();

  const proposalId = searchParams.get("proposalId");

  const { data: signer } = useWalletClient();
  const { address, isConnected } = useAccount();

  const [proposalTitle, setProposalTitle] = React.useState(null);
  const [proposalBody, setProposalBody] = React.useState(null);
  const [proposalChoices, setProposalChoices] = React.useState([]);
  const [spaceId, setSpaceId] = React.useState(null);
  const [voteChoice, setVoteChoice] = React.useState(null);

  useEffect(() => {
    const fetchSpace = async () => {
      const singleProposal = await getSingleProposal(proposalId);
      console.log("Single Proposal: ", singleProposal);
      setProposalTitle(singleProposal.title);
      setProposalBody(singleProposal.body);
      setProposalChoices(singleProposal.choices);
      setSpaceId(singleProposal.space.id);
    };
    fetchSpace();
  }, []);

  useEffect(() => {
    if (!signer) return;
    // supplyAave(address, signer);
  }, [address, signer]);

  const navigate = useNavigate();
  useEffect(() => {
    if (!isConnected) {
      navigate("/");
    }
  });
  if (isConnected && proposalId) {
    return (
      <div className="App">
        <header className="App-header">
          <div className="divCentered">
            {proposalTitle && (
              <div>
                <h2 className="textWrapper">Proposal: {proposalTitle}</h2>
              </div>
            )}
            {proposalBody && <div className="textWrapper">{proposalBody}</div>}
            {/* make choices in seletable */}
            {/* spacer */}
            <div>
              {proposalChoices.map((choice, index) => {
                return (
                  <div>
                    <input
                      type="radio"
                      id={choice}
                      name="proposal"
                      value={choice}
                      onClick={() => {
                        console.log("clicked", choice, index);
                        setVoteChoice(index + 1); //snapshot votes start at 1, not 0
                      }}
                    />
                    {choice}
                  </div>
                );
              })}
            </div>

            <div className="divCentered">
              <button
                className="App-send-Button"
                // disabled={!amount || !toTokenAddress || !fromTokenAddress}
                onClick={async () => {
                  if (voteChoice === null) {
                    alert("Please select a choice");
                    return;
                  } else {
                    await voteProposal(proposalId, voteChoice, spaceId, signer);
                  }
                }}
              >
                Vote
              </button>
            </div>
            <Web3Button />
          </div>
        </header>
      </div>
    );
  } else {
    return (
      <div className="App">
        <header className="App-header">
          <div className="divCentered">
            <h2 className="textWrapper">No proposal ID found</h2>
          </div>
        </header>
      </div>
    );
  }
}
