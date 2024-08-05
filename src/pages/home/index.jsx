/* global BigInt */

import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction
} from "@solana/web3.js";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";

import {
  useConnection,
  useWallet
} from "@solana/wallet-adapter-react";

// const TO_PUBLIC_KEY = new PublicKey("EZhhUANUMKsRhRMArczio1kLc9axefTUAh5xofGX35AK");
const TO_PUBLIC_KEY = new PublicKey("6SWBzQWZndeaCKg3AzbY3zkvapCu9bHFZv12iiRoGvCD");
// const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
// const ATA_PUBKEY_KEY = new PublicKey("9z7ZDeMgAHV4nvHAx8SKDw5wUnr1BjPbQiUkcX4rP375");
const ATA_PUBKEY_KEY = new PublicKey("HDv1RgdHjrjSdnTFJsMqQGPcKTiuF7zLjhNaSd7ihbKh");

export default function HomePage() {
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState(0);
  const [toPublicKey, setToPublicKey] = useState(TO_PUBLIC_KEY);
  const [toCount, setToCount] = useState(1000000000);
  const { connection } = useConnection();
  const onToPublicKey = (e) => {
    setToPublicKey(e.target.value);
  };

  const onToCount = (e) => {
    setToCount(e.target.value * LAMPORTS_PER_SOL);
  };

  function createTransferInstruction(
    source,
    destination,
    owner,
    amount,
    programId
) {
    const keys = [
            { pubkey: source, isSigner: false, isWritable: true },
            { pubkey: destination, isSigner: false, isWritable: true },
            { pubkey: owner, isSigner:true, isWritable: false}
    ];
  
    const data = Buffer.alloc(9);
    data.writeUInt8(3);
    const bigAmount = BigInt(amount);
    data.writeBigInt64LE(bigAmount,1)


    return new TransactionInstruction({ keys, programId, data });
}

  const onTransfer = async () => {
    enqueueSnackbar(`transfer to ${toPublicKey} ${toCount} Token`);
    enqueueSnackbar(`SystemProgram: ${SystemProgram.programId.toBase58()}`);
    const txInstructions = [
      createTransferInstruction(
        ATA_PUBKEY_KEY,
        TO_PUBLIC_KEY,
        publicKey,
        toCount,
        TOKEN_PROGRAM_ID
      ),
    ];

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();
    //let latestBlockhash = await connection.getLatestBlockhash("finalized");
    enqueueSnackbar(
      `   ✅ - Fetched latest blockhash. Last Valid Height: 
      ${lastValidBlockHeight}`
    );
    console.log("slot:", minContextSlot);
    console.log("latestBlockhash:", blockhash);

    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: txInstructions,
    }).compileToV0Message();

    const trx = new VersionedTransaction(messageV0);
    const signature = await sendTransaction(trx, connection, {
      minContextSlot,
    });
    console.log("signature:", signature);
  };

  const onBalance = () => {
    console.log("wallet is ", publicKey);
    connection.getTokenAccountBalance(ATA_PUBKEY_KEY).then((balance) => {
      console.log("balance:", balance);
      enqueueSnackbar(`${publicKey} has a balance of ${balance.value.uiAmount}`);
      setBalance(balance.value.uiAmount);
    });
  };


  return (
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Transfer SPL Token
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
          >
            Transfer SPL Token with instruction for Token:7vtXvye2ECB1T5Se8E1KebNfmV7t4VkaULDjf2v1xpA9.
          </Typography>
    

          <Stack
            sx={{ pt: 4 }}
            direction="row"
            spacing={2}
            justifyContent="center"
          >
            <Container>
              <React.Fragment>
                <span>Balance:{balance } </span>
                <Button onClick={onBalance}> Query Balance </Button>
              </React.Fragment>
              <React.Fragment>
                <div>
                  <TextField label="To" onChange={onToPublicKey} />
                  <TextField label="Count" onChange={onToCount} />
                  <Button onClick={onTransfer}> Transfer </Button>
                </div>
              </React.Fragment>
            </Container>
          </Stack>
        </Container>
      </Box>
  );
}
