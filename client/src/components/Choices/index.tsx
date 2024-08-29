import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Checkbox, Spin } from "antd";
import type { GetProp } from "antd";
import axios, { AxiosResponse } from "axios";

const NECESSARY_DOMAINS = [
  "com",
  "info",
  "co",
  "co.*",
  "io",
  "ai",
  "net",
  "au",
  "nl",
];

type Props = {
  setSelectedDomains: Dispatch<SetStateAction<string[]>>;
  selectedDomains: string[];
  domainName: string;
  purchasedDomains: string[];
};

type DomainPrice = {
  domain: string;
  price: number;
  renew: number;
  premium: number;
  duration: number;
};

const formatValue = (domainPrice: DomainPrice) => {
  return `${domainPrice.domain} - ${
    domainPrice.price < 6
      ? 7.99
      : domainPrice.price < 12
      ? 9.99
      : domainPrice.price < 16
      ? 19.99
      : 24.99
  }$`;
};

const Choices: React.FC<Props> = ({
  domainName,
  setSelectedDomains,
  purchasedDomains,
}) => {
  const [availableDomains, setAvailableDomains] = useState<DomainPrice[]>([]);
  const [isLoading, setLoading] = useState(false);
  const name = domainName.split(".")[0];

  const onChange: GetProp<typeof Checkbox.Group, "onChange"> = (
    checkedValues
  ) => {
    setSelectedDomains(checkedValues as string[]);
  };

  useEffect(() => {
    console.log("here");
    (async () => {
      setLoading(true);
      const {
        data: { availableDomains, success, message },
      } = (await axios
        .post<any, AxiosResponse<DomainPrice[]>>(
          "http://localhost:3000/namecheap/available-domains",
          {
            domains: NECESSARY_DOMAINS.map((tld) => `${name}.${tld}`).join(","),
          }
        )
        .finally(() => setLoading(false))) as any;
      if (success) {
        setAvailableDomains(availableDomains);
      } else {
        console.error(message);
      }
    })();
  }, []);

  return (
    <>
      <div>
        {!isLoading ? (
          <Checkbox.Group
            options={availableDomains.map((domainPrice) => ({
              label: formatValue(domainPrice),
              value: domainPrice.domain,
              disabled: purchasedDomains.includes(domainPrice.domain),
            }))}
            defaultValue={[domainName]}
            onChange={onChange}
            // value={selectedDomains}
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: "320px",
              gap: "10px",
              width: "100%",
              margin: "auto",
            }}
          />
        ) : (
          <Spin />
        )}
      </div>
    </>
  );
};

export default Choices;
