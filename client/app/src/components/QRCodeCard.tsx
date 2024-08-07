import { Flex, Icon, Image, Text, useColorModeValue } from "@chakra-ui/react";
import getCroppedImageUrl from "../Utils/image-url";
import IQrCode from "../entites/QrCode";
import { FaCopy, FaDownload, FaShare } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

interface IProps {
  qrCode: IQrCode;
}

const QRCodeCard = ({ qrCode }: IProps) => {
  const goTo = useNavigate();
  const iconColor = useColorModeValue("grey", "gray");

  return (
    <Flex
      gap={3}
      p={2}
      direction={"column"}
      alignItems={"start"}
      border={"1px solid gray"}
      borderRadius={5}
      maxInlineSize={"fit-content"}
    >
      <Flex gap={2}>
        <Image
          objectFit="cover"
          maxW={{ base: "100px", sm: "50px" }}
          src={getCroppedImageUrl(qrCode.qrCode || "")}
          alt="Link QR Code"
          borderRadius={5}
          onClick={() => goTo(`/links/${qrCode.id}`)}
        />

        <Flex
          direction={"column"}
          justifyContent={"space-evenly"}
          height={20}
          my={2}
        >
          <Icon as={FaCopy} color={iconColor} />
          <Icon as={FaShare} color={iconColor} />
          <Icon as={FaDownload} color={iconColor} />
        </Flex>
      </Flex>
      <Text
        fontSize={"12px"}
        className="truncate leading-10"
        maxWidth={"100px"}
        textAlign={"center"}
      >
        {qrCode.link}
      </Text>
    </Flex>
  );
};

export default QRCodeCard;
