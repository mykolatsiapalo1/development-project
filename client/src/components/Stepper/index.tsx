import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  List,
  message,
  Select,
  Spin,
  Steps,
  theme,
  Typography,
} from "antd";
import Choices from "../Choices";
import axios from "axios";

const Stepper: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);

  const [domainName, setDomainName] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [recipient, setRecipient] = useState("mykola@meetz.ai");
  const [status, setStatus] = useState<boolean | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [purchasedDomains, setPurchasedDomains] = useState<string[]>([]);
  const [processed, setProcessed] = useState(0);

  useEffect(() => {
    setProcessed(0);
  }, [domainName, selectedDomains]);

  const handleSendMessage = async () => {
    setLoading(true);
    for (const domain of purchasedDomains) {
      await axios
        .post("http://localhost:3000/namecheap/send-message", {
          recipient,
          domain,
        })
        .finally(() => setLoading(false));
    }
  };

  const steps = [
    {
      title: "Name",
      content: (
        <>
          <Input
            placeholder="Enter domain/company name"
            onChange={(e) => {
              setDomainName(e.target.value);
              setStatus(null);
              setStatusMessage("");
            }}
            value={domainName}
            style={{ width: "320px" }}
            status={!status && status !== null ? "error" : undefined}
          />
          {message && <Typography>{statusMessage}</Typography>}
        </>
      ),
    },
    {
      title: "List",
      content: (
        <>
          <Choices
            domainName={domainName}
            setSelectedDomains={setSelectedDomains}
            selectedDomains={selectedDomains}
            purchasedDomains={purchasedDomains}
          />
        </>
      ),
    },
    {
      title: "Emails",
      content: (
        <div>
          <div
            style={{
              display: "inline-flex",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <Input
              defaultValue="example"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              style={{ width: "320px" }}
            />
            <Button type="primary" onClick={handleSendMessage}>
              Send mail
            </Button>
          </div>
          {/* <List
            bordered
            dataSource={emails}
            renderItem={(item) => (
              <List.Item>
                <Typography.Text mark>[ITEM]</Typography.Text> {item}
              </List.Item>
            )}
          /> */}
        </div>
      ),
    },
  ];

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    lineHeight: "260px",
    textAlign: "center",
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  const goNext = (fn: () => void) => {
    return async function () {
      try {
        await fn();
        setStatus(true);
        next();
      } catch (e: any) {
        setStatus(false);
      }
    };
  };

  const checkAvailability = async () => {
    setLoading(true);
    const {
      data: { success, message },
    } = await axios
      .post("http://localhost:3000/namecheap/check-domain", {
        domain: domainName,
      })
      .finally(() => setLoading(false));

    console.log("success", success);
    if (!success) {
      throw new Error(message);
    }
    setSelectedDomains((prev) => [...prev, domainName]);
  };

  const purchase = async () => {
    let isSuccess = true;
    setLoading(true);
    for (let i = 0; i < selectedDomains.length; i++) {
      const {
        data: { success, message },
      } = await axios
        .post(
          "http://localhost:3000/namecheap/purchase-domain-and-set-record",
          {
            domain: selectedDomains[i],
          }
        )
        .finally(() => setProcessed((prev) => prev + 1));

      console.log("success", success);
      if (!success) {
        isSuccess = false;
        setStatusMessage(message);
      } else {
        setPurchasedDomains((prev) => [...prev, selectedDomains[i]]);
      }
    }
    setLoading(false);
    if (!isSuccess) {
      throw new Error();
    }
  };

  const handlerFunction = [goNext(checkAvailability), goNext(purchase)];

  return (
    <>
      <Steps current={current} items={items} />
      <div style={contentStyle}>{steps[current].content}</div>
      <div style={{ marginTop: 24 }}>
        {current < steps.length - 1 && (
          <Button
            type="primary"
            onClick={handlerFunction[current]}
            disabled={
              (current === 1 && selectedDomains.length === 0) || isLoading
            }
          >
            {current === 1 ? (
              `Purchase ${
                isLoading ? `${processed} / ${selectedDomains.length}` : ""
              }`
            ) : isLoading ? (
              <Spin />
            ) : (
              "Next"
            )}
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button
            type="primary"
            onClick={() => message.success("Processing complete!")}
          >
            Done
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: "0 8px" }} onClick={() => prev()}>
            Previous
          </Button>
        )}
        {purchasedDomains.length > 0 && current === 1 && !isLoading && (
          <Button style={{ margin: "0 8px" }} onClick={() => next()}>
            Next
          </Button>
        )}
      </div>
    </>
  );
};

export default Stepper;
